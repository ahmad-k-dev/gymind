using System.Diagnostics.Eventing.Reader;
using System.Text.Json;

namespace GYMIND.API.Entities
{
    public class GymBranch
    {
        public Guid GymBranchID { get; set; }
        public Guid GymID { get; set; }
        public Guid? LocationID { get; set; }
        public string Name { get; set; } = null!;
        public JsonDocument OpeningHours { get; set; } = null!;
        public string? ServiceDescription { get; set; }
        public string? CoverImageUrl { get; set; }
        public bool IsActive { get; set; }

        public Gym Gym { get; set; } = null!;
        public Location? Location { get; set; } = null!;
        public ICollection<Membership> Memberships { get; set; } = new List<Membership>();
    }
}
