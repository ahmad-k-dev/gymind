using GYMIND.API.Interfaces;
using GYMIND.API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;

namespace GYMIND.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<AuthController> _logger;

        public AuthController(IUserService userService, ILogger<AuthController> logger)
        {
            _userService = userService;
            _logger = logger;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
                return BadRequest("Email and password are required.");

            var token = await _userService.LoginAsync(dto);

            if (token == null)
                return Unauthorized("Invalid credentials.");

            return Ok(token);
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] CreateUserDto dto)
        {
            _logger.LogInformation("REGISTER HIT: {Email}", dto?.Email);

            try
            {
                var user = await _userService.CreateUserAsync(dto);
                _logger.LogInformation("REGISTER OK: {Email} {UserId}", user.Email, user.UserID);
                return CreatedAtAction("GetUser", "Users", new { id = user.UserID }, user);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "REGISTER FAILED for {Email}", dto?.Email);
                return StatusCode(500, new { message = ex.Message, detail = ex.ToString() });
            }
        }


        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest("Email is required.");

            await _userService.RequestPasswordResetAsync(dto.Email);
            return Ok(new { message = "If an account exists for this email, a reset link has been sent." });
        }

        [HttpPost("reset-password")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto dto)
        {
            var success = await _userService.ResetPasswordAsync(dto);
            if (!success)
                return BadRequest("Invalid token, expired token, or weak password.");

            return Ok(new { message = "Password has been reset successfully." });
        }

        [HttpPost("refresh")]

        public async Task<IActionResult> Refresh([FromBody] TokenExchangeRequestDto dto)

        
        {
            if (string.IsNullOrEmpty(dto.Token) || string.IsNullOrEmpty(dto.RefreshToken))
                return BadRequest("Invalid client request");

            var response = await _userService.RefreshTokenAsync(dto.Token, dto.RefreshToken);

            if (response == null)
                return Unauthorized("Invalid or expired session.");

            return Ok(response);
        }


    }
}