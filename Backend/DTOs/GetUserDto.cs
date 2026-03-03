namespace GYMIND.API.DTOs
{
    public record GetUserDto
    {
        public Guid UserID { get; set; }
        public string FullName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public string? Phone { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<int> Roles { get; set; } = new();
    }

}
