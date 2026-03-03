using GYMIND.API.Data;
using GYMIND.API.DTOs.Notifications;
using GYMIND.API.Entities;
using GYMIND.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;

namespace GYMIND.API.Services
{
    public class NotificationService : INotificationService
    {
        private readonly SupabaseDbContext _context;
        private readonly IHttpContextAccessor _httpContextAccessor;

        public NotificationService(
            SupabaseDbContext context,
            IHttpContextAccessor httpContextAccessor)
        {
            _context = context;
            _httpContextAccessor = httpContextAccessor;
        }

        private Guid GetCurrentUserId()
        {
            var userID = _httpContextAccessor.HttpContext?
                .User?
                .FindFirst(ClaimTypes.NameIdentifier)?
                .Value;

            return Guid.Parse(userID!);
        }

        // =========================================
        // 1️⃣ Create Notification For Gym 
        // =========================================
        public async Task CreateForGymAsync(Guid gymId, CreateNotificationDto dto)
        {
            var notification = new Notification
            {
                NotificationID = Guid.NewGuid(),
                GymID = gymId,
                Title = dto.Title,
                Message = dto.Message,
                SentAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);

            // Get all active members of this gym
            var users = await _context.Memberships
                .Where(m => m.GymID == gymId && m.IsMember 
                                             && m.RemovedAt == null
                                             && (m.ExpiryDate == null || m.ExpiryDate > DateTime.UtcNow))
                .Select(m => new {m.UserID, m.MembershipID})
                .ToListAsync();

            var userNotifications = users.Select(member => new UserNotification
            {
                UserNotificationID = Guid.NewGuid(),
                UserID = member.UserID,
                NotificationID = notification.NotificationID,
                ReadStatus = false
            }).ToList();

            _context.UserNotifications.AddRange(userNotifications);

            await _context.SaveChangesAsync();
        }

        // =========================================
        // 2️⃣ Create Notification For Branch
        // =========================================
        public async Task CreateForBranchAsync(Guid branchId, CreateNotificationDto dto)
        {
            var branch = await _context.GymBranches
                .FirstOrDefaultAsync(b => b.GymBranchID == branchId);

            if (branch == null)
                throw new Exception("Branch not found");

            var notification = new Notification
            {
                NotificationID = Guid.NewGuid(),
                GymID = branch.GymID,
                GymBranchID = branchId,
                Title = dto.Title,
                Message = dto.Message,
                SentAt = DateTime.UtcNow
            };

            _context.Notifications.Add(notification);

            // Since membership is by gym only
            var users = await _context.Memberships
                .Where(m => m.GymID == branch.GymID && m.IsMember && m.RemovedAt == null)
                .Select(m => m.UserID)
                .Distinct()
                .ToListAsync();

            var userNotifications = users.Select(userID => new UserNotification
            {
                UserID = userID,
                NotificationID = notification.NotificationID,
                ReadStatus = false
            }).ToList();

            _context.UserNotifications.AddRange(userNotifications);

            await _context.SaveChangesAsync();
        }

        // =========================================
        // 3️⃣ Get My Notifications
        // =========================================
        public async Task<List<NotificationDto>> GetMyNotificationsAsync()
        {
            var userID = GetCurrentUserId();

            var notifications = await _context.UserNotifications
                .Where(un => un.UserID == userID)
                .Join(_context.Notifications,
                    un => un.NotificationID,
                    n => n.NotificationID,
                    (un, n) => new NotificationDto
                    {
                        NotificationID = n.NotificationID,
                        Title = n.Title,
                        Message = n.Message,
                        SentAt = n.SentAt,
                        GymId = n.GymID,
                        GymBranchID = n.GymBranchID,
                        IsRead = un.ReadStatus,
                        ReadAt = un.ReadAt
                    })
                .OrderByDescending(x => x.SentAt)
                .ToListAsync();

            return notifications;
        }

        // =========================================
        // 4️⃣ Mark As Read
        // =========================================
        public async Task MarkAsReadAsync(Guid notificationId)
        {
            var userID = GetCurrentUserId();

            var userNotification = await _context.UserNotifications
                .FirstOrDefaultAsync(un =>
                    un.UserID == userID &&
                    un.NotificationID == notificationId);

            if (userNotification == null)
                throw new Exception("Notification not found");

            userNotification.ReadStatus = true;
            userNotification.ReadAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();
        }
    }
}
