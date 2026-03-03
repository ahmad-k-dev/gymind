using GYMIND.API.DTOs;
using GYMIND.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GYMIND.API.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class GymSessionController : ControllerBase
    {
        private readonly IGymSessionService _gymSessionService;

        public GymSessionController(IGymSessionService gymSessionService)
        {
            _gymSessionService = gymSessionService;
        }

        [HttpPost("check-in")]
        public async Task<IActionResult> CheckIn([FromBody] CheckInDto dto)
        {
            // Extract the User ID from the JWT token claims
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var result = await _gymSessionService.StartGymSessionAsync(userId, dto);

            if (!result)
                return BadRequest("Could not start session. Ensure the branch exists.");

            return Ok(new { message = "Checked in successfully!" });
        }

        [HttpPost("check-out")]
        public async Task<IActionResult> CheckOut()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var result = await _gymSessionService.EndGymSessionAsync(userId);

            if (!result)
                return NotFound("No active session found for this user.");

            return Ok(new { message = "Checked out successfully!" });
        }

        [HttpGet("my-history")]
        public async Task<IActionResult> GetHistory()
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var history = await _gymSessionService.GetUserHistoryAsync(userId);
            return Ok(history);
        }

        [Authorize(Roles = "Admin,GymOwner")]
        [HttpGet("active/{branchId}")]
        public async Task<IActionResult> GetActiveSessions(Guid branchId)
        {
            var activeSessions = await _gymSessionService.GetActiveSessionForBranchAsync(branchId);
            return Ok(activeSessions);
        }


    }
}