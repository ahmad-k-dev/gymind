namespace GYMIND.API.Entities
{
    public class TrafficTrack
    {
        public Guid TrafficTrackID { get; set; }
        public Guid GymBranchID { get; set; }
        public DateTime TrafficTimestamp { get; set; }
        public decimal? CapacityPercentage { get; set; }
        public int EntryCount { get; set; }
        public bool? IsRead { get; set; }

        public GymBranch GymBranch { get; set; } = null!;
    }
}
