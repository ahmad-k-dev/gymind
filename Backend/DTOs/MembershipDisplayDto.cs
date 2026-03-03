namespace GYMIND.API.DTOs
{
    // This DTO is used for displaying detailed information about a user's membership to the user
    public record MembershipDisplayDto
    {
        public Guid MembershipID { get; set; }
        public string GymName { get; set; } = null!;
        public string? BranchName { get; set; }
        public DateTime JoinedAt { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public bool IsActive { get; set; }
        public string? Description { get; set; }
    }
}
