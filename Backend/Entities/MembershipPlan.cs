namespace GYMIND.API.Entities
{
    public class MembershipPlan
    {
        public Guid MembershipPlanID { get; set; }
        public Guid GymID { get; set; }
        public string? PlanName { get; set; }
        public decimal Price { get; set; }
        public int DurationInMonths { get; set; }
        public string? Description { get; set; }
    }
}
