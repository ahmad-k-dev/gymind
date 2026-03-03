
using GYMIND.API.DTOs;



namespace GYMIND.API.Interfaces
{
    public interface IUserService
    {
        Task<IEnumerable<GetUserDto>> GetAllUsersAsync();
        Task<GetUserDto?> GetUserByIdAsync(Guid id);
        Task<GetUserDto> CreateUserAsync(CreateUserDto dto);
        Task<bool> UpdateUserAsync(Guid id, UpdateUserDto dto);
        Task<bool> DeactivateUserAsync(Guid id);

        Task<TokenExchangeRequestDto?> LoginAsync(LoginRequestDto dto);
        Task<bool> UpdateProfileAsync(Guid userId, EditProfileDto dto);
        Task<TokenExchangeRequestDto?> RefreshTokenAsync(string token, string refeshToken);

        


    }
}
