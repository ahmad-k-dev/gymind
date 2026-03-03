using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace GYMIND.API.DTOs
{
    public record EditProfileDto
    {
        [StringLength(100)]
        public string? FullName { get; set; }

        [StringLength(500)]
        public string? Biography { get; set; }

        
        // This receives the image file from the user's phone/local storage.
        public IFormFile? ImageFile { get; set; }

        public string? MedicalConditions { get; set; }

        public string? EmergencyContact { get; set; }

        // Note: Email and Password are excluded here to handle them through a more secure verification-based flow.
        
    }
}