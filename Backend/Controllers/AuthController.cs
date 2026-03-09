using GYMIND.API.Interfaces;
using GYMIND.API.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Net;

namespace GYMIND.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService _userService;
        private readonly ILogger<AuthController> _logger;
        private readonly IWebHostEnvironment _environment;

        public AuthController(IUserService userService, ILogger<AuthController> logger, IWebHostEnvironment environment)
        {
            _userService = userService;
            _logger = logger;
            _environment = environment;
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



        private bool ShouldExposeResetTokenForRequest()
        {
            if (_environment.IsDevelopment())
                return true;

            var origin = Request.Headers.Origin.ToString();
            if (string.IsNullOrWhiteSpace(origin))
                return false;

            if (!Uri.TryCreate(origin, UriKind.Absolute, out var uri))
                return false;

            return string.Equals(uri.Host, "localhost", StringComparison.OrdinalIgnoreCase)
                || string.Equals(uri.Host, "127.0.0.1", StringComparison.OrdinalIgnoreCase)
                || string.Equals(uri.Host, "::1", StringComparison.OrdinalIgnoreCase);
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto dto)
        {
            if (dto == null || string.IsNullOrWhiteSpace(dto.Email))
                return BadRequest("Email is required.");

            var resetToken = await _userService.RequestPasswordResetAsync(dto.Email);

            if (ShouldExposeResetTokenForRequest() && !string.IsNullOrWhiteSpace(resetToken))
                return Ok(new { message = "If an account exists for this email, a reset link has been sent.", developmentResetToken = resetToken });

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