using System.ComponentModel.DataAnnotations;

namespace GYMIND.API.DTOs
{
    public record LoginRequestDto
    {
        [Required]
        public string Email { get; set; } = string.Empty;
        [Required]
        public string Password { get; set; } = string.Empty;
    }
}