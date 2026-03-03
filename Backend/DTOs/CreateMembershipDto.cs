namespace GYMIND.API.DTOs
{
    public record CreateMembershipDto
    {
        public Guid GymID { get; set; }
        public Guid? GymBranchID { get; set; }
        public DateTime? ExpiryDate { get; set; }
        public string? Description { get; set; }
    }
}
