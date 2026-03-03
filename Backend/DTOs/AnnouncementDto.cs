namespace GYMIND.API.DTOs
{
    public class AnnouncementDto
    {
        public Guid AnnouncementID { get; set; }
        public Guid GymBranchID { get; set; }
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public DateTime CreatedAt { get; set; }
        public DateTime? ExpiresAt { get; set; }
    }
}
