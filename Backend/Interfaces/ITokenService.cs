using GYMIND.API.Entities;

namespace GYMIND.API.Interfaces
{
    public interface ITokenService
    {
        string CreateToken(User user, IEnumerable<UserRole> userRoles);
        Guid GetUserIdFromExpiredToken(string token);
    }
}
