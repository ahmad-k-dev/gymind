namespace GYMIND.API.Entities
{
    public class Location
    {
        public Guid LocationID { get; set; }
        public decimal Latitude { get; set; }
        public decimal Longitude { get; set; }
        public string City { get; set; } = null!; // change name to location
        public string Country { get; set; } = null!;
    }
}
