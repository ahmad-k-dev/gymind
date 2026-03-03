using GYMIND.API.Data;
using GYMIND.API.DTOs;
using GYMIND.API.Entities;
using GYMIND.API.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace GYMIND.API.Service
{
    public class GymService : IGymService
    {
        private readonly SupabaseDbContext _context;

        public GymService(SupabaseDbContext context)
        {
            _context = context;
        }

        private static GymDto MapGymToDto(Gym gym)
        {
            return new GymDto
            {
                GymID = gym.GymID,
                Name = gym.Name,
                Description = gym.Description,
                IsApproved = gym.IsApproved,
                CreatedAt = gym.CreatedAt
            };
        }

        public async Task<IEnumerable<GymDto>> GetAllGymsAsync()
        {
            var gyms = await _context.Gym
                .AsNoTracking()
                .Include(g => g.GymBranches)
                .ToListAsync();

            return gyms.Select(MapGymToDto);
        }

        public async Task<GymDto?> GetGymByIdAsync(Guid id)
        {
            var gym = await _context.Gym
                .Include(g => g.GymBranches)
                .FirstOrDefaultAsync(g => g.GymID == id && g.IsApproved);

            return gym is null ? null : MapGymToDto(gym);
        }

        public async Task<GymDto?> GetGymByNameAsync(string name)
        {
            var gym = await _context.Gym
                .Include(g => g.GymBranches)
                .FirstOrDefaultAsync(g => g.Name == name);

            return gym is null ? null : MapGymToDto(gym);
        }

        /// <summary>
        /// Fixed: query gyms by address safely without projection Include issues
        /// </summary>
        public async Task<IEnumerable<GymDto>> GetGymsByAddressAsync(string address)
        {
            var gyms = await _context.Gym
                .Include(g => g.GymBranches)
                    .ThenInclude(gb => gb.Location) // include location for City
                .Where(g => g.GymBranches.Any(gb => gb.Location.City.Contains(address)) && g.IsApproved)
                .ToListAsync();

            return gyms.Select(MapGymToDto);
        }

        public async Task<GymDto> CreateGymAsync(GymDto dto)
        {
            var gym = new Gym
            {
                GymID = Guid.NewGuid(),
                Name = dto.Name,
                Description = dto.Description,
                IsApproved = false,
                CreatedAt = DateTime.UtcNow
            };

            await _context.Gym.AddAsync(gym);
            await _context.SaveChangesAsync();

            return MapGymToDto(gym);
        }

        public async Task<bool> UpdateGymAsync(Guid id, GymDto dto)
        {
            var gym = await _context.Gym.FindAsync(id);
            if (gym is null) return false;

            gym.Name = dto.Name ?? gym.Name;
            gym.Description = dto.Description ?? gym.Description;
            gym.IsApproved = dto.IsApproved;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<GymBranchDto> CreateBranchAsync(Guid gymId, GymBranchDto dto)
        {
            var gymExists = await _context.Gym.AnyAsync(g => g.GymID == gymId);
            if (!gymExists)
                throw new Exception("Gym not found.");

            var branch = new GymBranch
            {
                GymBranchID = Guid.NewGuid(),
                GymID = gymId,
                LocationID = dto.LocationID,
                Name = dto.Name,
                OpeningHours = dto.OperatingHours,
                ServiceDescription = dto.ServiceDescription,
                CoverImageUrl = dto.CoverImageUrl,
                IsActive = true
            };

            await _context.GymBranches.AddAsync(branch);
            await _context.SaveChangesAsync();

            dto.GymBranchID = branch.GymBranchID;
            return dto;
        }

        public async Task<GymBranchDto?> GetBranchByIdAsync(Guid branchId)
        {
            var branch = await _context.GymBranches
                .Include(b => b.Gym) // optional: include gym if you need its data
                // .Include(b => b.Location) // optional: include location
                .FirstOrDefaultAsync(b => b.GymBranchID == branchId);

            if (branch is null) return null;

            return new GymBranchDto
            {
                GymBranchID = branch.GymBranchID,
                GymID = branch.GymID,
                LocationID = branch.LocationID,
                Name = branch.Name,
                OperatingHours = branch.OpeningHours,
                ServiceDescription = branch.ServiceDescription,
                CoverImageUrl = branch.CoverImageUrl
            };
        }

        public async Task<bool> UpdateBranchAsync(Guid branchId, GymBranchDto dto)
        {
            var branch = await _context.GymBranches.FindAsync(branchId);
            if (branch is null) return false;

            branch.Name = dto.Name ?? branch.Name;
            branch.OpeningHours = dto.OperatingHours ?? branch.OpeningHours;
            branch.ServiceDescription = dto.ServiceDescription ?? branch.ServiceDescription;
            branch.CoverImageUrl = dto.CoverImageUrl ?? branch.CoverImageUrl;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
