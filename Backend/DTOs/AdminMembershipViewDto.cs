namespace GYMIND.API.DTOs
{
    public record AdminMembershipViewDto
    {
        public Guid MembershipID { get; set; }
        public Guid UserID { get; set; }
        public string UserFullName { get; set; } = null!;
        public string UserEmail { get; set; } = null!;
        public DateTime JoinedAt { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public bool IsActive { get; set; }
        public bool IsMember { get; set; }

    }
}
