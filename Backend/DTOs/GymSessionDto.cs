namespace GYMIND.API.DTOs
{
    public record GymSessionDto
    {
        public Guid UserId { get; set; }
        public DateTime CheckInTime { get; set; }
        public DateTime CheckOutTime { get; set; }
        public int SessionDuration { get; set; } // Duration in minutes
            public decimal CheckInLat { get; set; }
            public decimal CheckInLong { get; set; }
            public bool IsVerifiedLocation { get; set; }

        }

    
    public record ActiveSessionDto
    {
        public Guid GymSessionID { get; set; }
        public string Description { get; set; } = null!;
        public DateTime CheckInTime { get; set; }
        public bool IsVerifiedLocation { get; set; }
    }


    public record GymSessionHistoryDto
    {
        public Guid GymSessionID { get; set; }
        public string Description { get; set; } = null!;
        public DateTime CheckInTime { get; set; }
        public DateTime CheckOutTime { get; set; }
        public int? SessionDuration { get; set; } // Duration in minutes
        
        public  int DurationMinutes { get; set; }
        public string BranchName { get; set; } 
    }

    public record CheckInDto
    {
        public Guid GymBranchID { get; set; }
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
    }
}
