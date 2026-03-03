namespace GYMIND.API.DTOs
{
    public record TokenExchangeRequestDto
    {
        public string Token { get; set; } = null!;
        public string RefreshToken { get; set; } = null!; 
        public List<string> Roles { get; set; } = new();

        public Guid UserID { get; set; }
    }
}