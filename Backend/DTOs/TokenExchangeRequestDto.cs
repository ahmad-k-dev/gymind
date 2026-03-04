using System.Text.Json.Serialization;

namespace GYMIND.API.DTOs
{
    public record TokenExchangeRequestDto
    {
        [JsonPropertyName("Token")]
        public string Token { get; set; } = null!;
        [JsonPropertyName("RefreshToken")]
        public string RefreshToken { get; set; } = null!; 
        [JsonPropertyName("Roles")]
        public List<string> Roles { get; set; } = new();

        [JsonPropertyName("UserID")]
        public Guid UserID { get; set; }
    }
}