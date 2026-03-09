namespace GYMIND.API.DTOs
{
    public record GetUserDto
    {
        public Guid UserID { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public DateTime CreatedAt { get; set; }
        public string? Biography { get; set; }
        public string? MedicalConditions { get; set; }
        public string? EmergencyContact { get; set; }
        public decimal? Height { get; set; }
        public decimal? Weight { get; set; }
        public List<int> Roles { get; set; } = new();
    }

}
