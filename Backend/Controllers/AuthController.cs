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