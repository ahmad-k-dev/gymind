using GYMIND.API.Data;
using GYMIND.API.DTOs;
using GYMIND.API.Entities;
using GYMIND.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using Supabase.Gotrue;
using System.Text.Json;

namespace GYMIND.API.Services
{
    public class GymSessionService : IGymSessionService
    {
        private readonly SupabaseDbContext _context;
        private const double MaxDistanceKm = 0.15;

        public GymSessionService(SupabaseDbContext context)
        {
            _context = context;
        }

        public async Task<bool> StartGymSessionAsync(Guid UserId, CheckInDto dto)
        {
            // Implementation for starting a gym session, including location verification
            // This will involve checking the user's location against the gym's location and creating a new GymSession record

            // 1. Get branch location
            var branch = await _context.GymBranches
                .Include(gb => gb.Location)
                .FirstOrDefaultAsync(gb => gb.GymBranchID == dto.GymBranchID);

            if (branch == null) return false;

            if (!IsGymOpen(branch.OpeningHours))
            {
                return false;
            }

            // 2. Verify location
            double distance = CalculateDistance
                (dto.Latitude, dto.Longitude, branch.Location.Latitude, branch.Location.Longitude);

            bool isVerified = distance <= MaxDistanceKm;

            // 3. Create GymSession record
            var session = new GymSession
            {
                GymSessionID = Guid.NewGuid(),
                UserID = UserId,
                GymBranchID = dto.GymBranchID,
                CheckInTime = DateTime.UtcNow,
                CheckInLat = dto.Latitude,
                CheckInLong = dto.Longitude,
                IsVerifiedLocation = isVerified
            };

            // 4. Save to database
            await UpdateTrafficCount(dto.GymBranchID, 1);

            _context.GymSessions.Add(session);
            return await _context.SaveChangesAsync() > 0;
        }

        private bool IsGymOpen(JsonDocument operatingHours)
        {
            // 1. Check if the JsonDocument itself is null 
            if (operatingHours == null) return true;

            var now = DateTime.UtcNow;
            string currentDay = now.DayOfWeek.ToString();
            TimeSpan currentTime = now.TimeOfDay;

            // 2. Access the root
            var root = operatingHours.RootElement;

            // 3. Check if the root is an object and contains the current day
            if (root.ValueKind == JsonValueKind.Object && root.TryGetProperty(currentDay, out var dayHours))
            {
                // Ensure the internal properties exist before calling GetString()
                if (dayHours.TryGetProperty("Open", out var openProp) &&
                    dayHours.TryGetProperty("Close", out var closeProp))
                {
                    var openStr = openProp.GetString();
                    var closeStr = closeProp.GetString();

                    if (TimeSpan.TryParse(openStr, out var openTime) &&
                        TimeSpan.TryParse(closeStr, out var closeTime))
                    {
                        // Standard hours logic
                        if (openTime < closeTime)
                        {
                            return currentTime >= openTime && currentTime <= closeTime;
                        }

                        // Overnight hours logic 
                        return currentTime >= openTime || currentTime <= closeTime;
                    }
                }
            }

            // If the day isn't listed in the JSON, we assume the gym is closed
            return false;
        }


        public async Task<bool> EndGymSessionAsync(Guid userId)
        {
            // Implementation for ending a gym session, including calculating session duration and updating the GymSession record
            // 1. Find active session for user
            var session = await _context.GymSessions
                .Where(gs => gs.UserID == userId && gs.CheckOutTime == DateTime.MinValue)
                .FirstOrDefaultAsync();
            if (session == null) return false;

            DateTime finishTime = DateTime.UtcNow;

            session.CheckOutTime = finishTime;


            TimeSpan duration = finishTime - session.CheckInTime;
            session.SessionDuration = (int)duration.TotalMinutes;

            if (duration.TotalMinutes < 1)
            {
                session.SessionDuration = 0;
            }

            // 3. Save changes to database
            await UpdateTrafficCount(session.GymBranchID, -1);
            return await _context.SaveChangesAsync() > 0;
        }

        // -- Helper methods --

        // Distance calculation using Haversine formula
        private double CalculateDistance(decimal lat1, decimal lon1, decimal lat2, decimal lon2)
        {
            double R = 6371; // Radius of the Earth in km
            double dLat = ToRadians((double)(lat2 - lat1));
            double dLon = ToRadians((double)(lon2 - lon1));
            double a =
                Math.Sin(dLat / 2) * Math.Sin(dLat / 2) +
                Math.Cos(ToRadians((double)lat1)) * Math.Cos(ToRadians((double)lat2)) *
                Math.Sin(dLon / 2) * Math.Sin(dLon / 2);
            double c = 2 * Math.Atan2(Math.Sqrt(a), Math.Sqrt(1 - a));
            return R * c; // Distance in km
        }
        private double ToRadians(double angle) => (Math.PI / 180) * angle;

        //
        public async Task<IEnumerable<ActiveSessionDto>> GetActiveSessionForBranchAsync(Guid gymBranchId)
        {
            return await _context.GymSessions
                .Where(gs => gs.GymBranchID == gymBranchId && gs.CheckOutTime == default)
                .Include(gs => gs.User)
                .Select(gs => new ActiveSessionDto
                {
                GymSessionID = gs.GymSessionID,
                Description = $"{gs.User.FullName} {gs.User.MembershipID}",
                CheckInTime = gs.CheckInTime,
                IsVerifiedLocation = gs.IsVerifiedLocation
                }).ToListAsync();
        }
        
        public async Task<IEnumerable<GymSessionHistoryDto>> GetUserHistoryAsync(Guid userId)
        {
            return await _context.GymSessions
                .Where(gs => gs.UserID == userId)
                .OrderByDescending(gs => gs.CheckInTime)
                .Select(gs => new GymSessionHistoryDto
                {
                    BranchName = gs.GymBranch.Name,
                    CheckInTime = gs.CheckInTime,
                    CheckOutTime = gs.CheckOutTime,
                    SessionDuration = gs.SessionDuration
                }).ToListAsync();
        }
            
        

        // Method to update traffic count for a gym branch
        private async Task UpdateTrafficCount(Guid gymBranchId, int change)
        {
            var trafficCount = await _context.TrafficTracks
                .OrderByDescending(tc => tc.TrafficTimestamp)
                .FirstOrDefaultAsync(tc => tc.GymBranchID == gymBranchId);

            var newEntry = new TrafficTrack
            {
                TrafficTrackID = Guid.NewGuid(),
                GymBranchID = gymBranchId,
                TrafficTimestamp = DateTime.UtcNow,
                EntryCount = (trafficCount?.EntryCount ?? 0) + change,
                IsRead = false
            };
            
            _context.TrafficTracks.Add(newEntry);
        }



    }

}
