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

        public AuthController(IUserService userService)
        {
            _userService = userService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequestDto dto)
        {
            if (dto == null || string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Password))
                return BadRequest("Email and password are required.");

            var token = await _userService.LoginAsync(dto);

            if (token == null)
                return Unauthorized("Invalid credentials.");

            return Ok(new { token });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] CreateUserDto dto)
        {
            try
            {
                var user = await _userService.CreateUserAsync(dto);

                // Points to the GetUser endpoint in the UsersController
                return CreatedAtAction("GetUser", "Users", new { id = user.UserID }, user);
            }
            catch (Exception ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [Authorize]
        
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