using System.Text.Json;

namespace GYMIND.API.DTOs
{
    public record GymBranchDto
    {
        public Guid GymBranchID { get; set; }
        public Guid GymID { get; set; }
        public Guid? LocationID { get; set; }
        public string Name { get; set; } = null!;
        public JsonDocument OperatingHours { get; set; } = null!;
        public string? ServiceDescription { get; set; }
        public string? CoverImageUrl { get; set; }
        public bool IsActive { get; set; }
    }

    public record GymDto
    {
        public Guid GymID { get; set; }
        public string Name { get; set; } = null!;
        public string? Description { get; set; } = null!;
        public bool IsApproved { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}