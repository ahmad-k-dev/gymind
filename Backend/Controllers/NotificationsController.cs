using GYMIND.API.DTOs.Notifications;
using GYMIND.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GYMIND.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    
    public class NotificationsController : ControllerBase
    {
        private readonly INotificationService _notificationService;

        public NotificationsController(INotificationService notificationService)
        {
            _notificationService = notificationService;
        }

        // =========================================
        // 1️⃣ Gym sends notification to its members
        // =========================================
        [HttpPost("gym/{gymId}")]
        public async Task<IActionResult> CreateForGym(
            Guid gymId,
            [FromBody] CreateNotificationDto dto)
        {
            await _notificationService.CreateForGymAsync(gymId, dto);
            return Ok("Notification sent to gym members.");
        }

        // =========================================
        // 2️⃣ Branch sends notification
        // =========================================
        [HttpPost("branch/{branchId}")]
        public async Task<IActionResult> CreateForBranch(
            Guid branchId,
            [FromBody] CreateNotificationDto dto)
        {
            await _notificationService.CreateForBranchAsync(branchId, dto);
            return Ok("Notification sent to branch members.");
        }

        // =========================================
        // 3️⃣ Get my notifications
        // =========================================
        [HttpGet("me")]
        public async Task<IActionResult> GetMyNotifications()
        {
            var result = await _notificationService.GetMyNotificationsAsync();
            return Ok(result);
        }

        // =========================================
        // 4️⃣ Mark notification as read
        // =========================================
        [HttpPatch("{notificationId}/read")]
        public async Task<IActionResult> MarkAsRead(Guid notificationId)
        {
            await _notificationService.MarkAsReadAsync(notificationId);
            return Ok("Marked as read.");
        }
    }
}
