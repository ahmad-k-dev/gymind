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
    public class MembershipController : ControllerBase
    {
        private readonly IMembershipService _membershipService;

        public MembershipController(IMembershipService membershipService)
        {
            _membershipService = membershipService;
        }

        private Guid GetCurrentUserId() =>
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        
        // USER ENDPOINTS
        

        [HttpGet("my-memberships")]
        public async Task<ActionResult<List<MembershipSummaryDto>>> GetMyMemberships()
        {
            var userId = GetCurrentUserId();
            var memberships = await _membershipService.GetMyMembershipsAsync(userId);
            return Ok(memberships);
        }

        [HttpGet("{id}/details")]
        public async Task<ActionResult<MembershipDisplayDto>> GetMembershipDetails(Guid id)
        {
            var userId = GetCurrentUserId();
            var details = await _membershipService.GetMembershipDetailsAsync(id, userId);

            if (details == null) return NotFound("Membership pass not found.");
            return Ok(details);
        }

        
        // ADMIN / STAFF ENDPOINTS
        

        [HttpPost("issue/{userId}")]
        public async Task<ActionResult<MembershipSummaryDto>> IssueMembership(Guid userId, CreateMembershipDto dto)
        {
            // Logic check: Ensure the person calling this has permissions for the specific GymID
            var result = await _membershipService.IssueMembershipAsync(userId, dto);
            return CreatedAtAction(nameof(GetMembershipDetails), new { id = result.MembershipID }, result);
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<MembershipSummaryDto>> UpdateMembership(Guid id, MembershipUpdateDto dto)
        {
            var result = await _membershipService.UpdateMembershipAsync(id, dto);
            if (result == null) return NotFound();
            return Ok(result);
        }

        [HttpDelete("{id}/cancel")]
        public async Task<IActionResult> CancelMembership(Guid id)
        {
            var success = await _membershipService.CancelMembershipAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }

        [HttpGet("verify/{id}")]
        public async Task<ActionResult<bool>> VerifyStatus(Guid id)
        {
            // This is the endpoint the "Front Desk" app would call when scanning a QR code
            var isValid = await _membershipService.VerifyMembershipStatusAsync(id);
            return Ok(new { valid = isValid });
        }

        [HttpGet("gym/{gymId}/members")]
        public async Task<ActionResult<List<AdminMembershipViewDto>>> GetGymMembers(Guid gymId)
        {
            var members = await _membershipService.GetGymMembersAsync(gymId);
            return Ok(members);
        }
    }
}