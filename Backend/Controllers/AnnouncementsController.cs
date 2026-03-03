using GYMIND.API.DTOs;
using GYMIND.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GYMIND.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class AnnouncementsController : ControllerBase
    {
        private readonly IAnnouncementService _announcementService;

        public AnnouncementsController(IAnnouncementService announcementService)
        {
            _announcementService = announcementService;
        }

        // =========================================
        // 1️⃣ Create for specific branch
        // =========================================
        [HttpPost("branch/{branchId}")]
        public async Task<IActionResult> CreateForBranch(
            Guid branchId,
            [FromBody] CreateAnnouncementDto dto)
        {
            await _announcementService.CreateForBranchAsync(branchId, dto);
            return Ok("Announcement created for branch.");
        }

        // =========================================
        // 2️⃣ Create for gym (all branches)
        // =========================================
        [HttpPost("gym/{gymId}")]
        public async Task<IActionResult> CreateForGym(
            Guid gymId,
            [FromBody] CreateAnnouncementDto dto)
        {
            await _announcementService.CreateForGymAsync(gymId, dto);
            return Ok("Announcement created for all gym branches.");
        }

        // =========================================
        // 3️⃣ Get my announcements
        // =========================================
        [HttpGet("me")]
        public async Task<IActionResult> GetMyAnnouncements()
        {
            var result = await _announcementService.GetMyAnnouncementsAsync();
            return Ok(result);
        }

        // =========================================
        // 4️⃣ Get announcements by branch
        // =========================================
        [HttpGet("branch/{branchId}")]
        public async Task<IActionResult> GetByBranch(Guid branchId)
        {
            var result = await _announcementService.GetByBranchAsync(branchId);
            return Ok(result);
        }

        // =========================================
        // 5️⃣ Delete announcement
        // =========================================
        [HttpDelete("{announcementId}")]
        public async Task<IActionResult> Delete(Guid announcementId)
        {
            await _announcementService.DeleteAsync(announcementId);
            return Ok("Announcement deleted.");
        }
    }
}
