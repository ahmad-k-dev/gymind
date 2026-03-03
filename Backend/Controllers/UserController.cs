using GYMIND.API.DTOs;
using GYMIND.API.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace GYMIND.API.Controllers
{

    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<UsersController> _logger;

        public UsersController(IUserService userService, ILogger<UsersController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetUsers()
            => Ok(await _userService.GetAllUsersAsync());

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetUser(Guid id)
        {
            var user = await _userService.GetUserByIdAsync(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        [HttpPost]
        public async Task<IActionResult> CreateUser([FromBody] CreateUserDto dto)
        {
            try
            {
                var user = await _userService.CreateUserAsync(dto);
                return CreatedAtAction(nameof(GetUser), new { id = user.UserID }, user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error creating user for email {Email}", dto?.Email);
                return StatusCode(500, "An error occurred while creating the user.");
            }
        }


        // This endpoint is specifically for admins to update any user's details, including roles.
        // Regular users will use the EditProfile endpoint to update their own information.
        [Authorize(Roles = "Admin")] 
        [HttpPut("admin/update-user/{id:guid}")]
        public async Task<IActionResult> AdminUpdateUser(Guid id, [FromBody] UpdateUserDto dto)
        {
            // The logic inside stays the same as your existing UpdateUserAsync
            var success = await _userService.UpdateUserAsync(id, dto);

            if (!success)
                return NotFound("User not found or is inactive.");

            return Ok(new { message = "User updated successfully by admin." });
        }

        
        
        [HttpPut("{id:guid}/deactivate")]
        public async Task<IActionResult> DeactivateUser(Guid id)
        {
            var success = await _userService.DeactivateUserAsync(id);
            if (!success) return NotFound();
            return NoContent();
        }


        [Authorize]
        [HttpPatch("edit-profile")]
        public async Task<IActionResult> EditProfile([FromForm] EditProfileDto dto)
        {
            var userId = Guid.Parse(User.FindFirst(ClaimTypes.NameIdentifier).Value);

            try
            {
                await _userService.UpdateProfileAsync(userId, dto);
                return Ok("Profile updated!");
            }
            catch (Exception ex) // to be edited to catch specific exceptions like ValidationException, etc.
            {
                
                return BadRequest(ex.Message);
            }
        }
    }
}
