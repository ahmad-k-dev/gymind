namespace GYMIND.API.DTOs
{
    public class CreateAnnouncementDto
    {
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;
        public DateTime? ExpiresAt { get; set; }
    }
}
