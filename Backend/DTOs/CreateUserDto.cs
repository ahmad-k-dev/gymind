using System.ComponentModel.DataAnnotations;

namespace GYMIND.API.DTOs
{
    public record CreateUserDto
    {
        [Required(ErrorMessage = "Please select a username")]
        public string FullName { get; set; } = null!;

        [Required(ErrorMessage = "Please provide your email")]
        public string Email { get; set; } = null!;

        [Required(ErrorMessage = "Please select a phone number")]
        public string? Phone { get; set; }

        [Required]
        [StringLength(100, MinimumLength = 6)]
        public string Password { get; set; } = null!;

        [Required(ErrorMessage = "Please select a gender")]
        public string Gender { get; set; }


        public string? Location { get; set; }
        public DateTime? DateOfBirth { get; set; }


    }
}
