namespace GYMIND.API.DTOs
{
    // This DTO is used to return a summary of a user's membership, including the gym name and membership status.
    public record MembershipSummaryDto
    {
        public Guid MembershipID { get; set; }
        public string GymName { get; set; } = null!;
        public bool IsActive { get; set; }
        public DateTime? ExpiryDate { get; set; }
    }
}
