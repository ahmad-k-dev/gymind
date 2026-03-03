using BCrypt.Net;
using GYMIND.API.Data;
using GYMIND.API.DTOs;
using GYMIND.API.Entities;
using GYMIND.API.Interfaces;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;

namespace GYMIND.API.Service
{

    public class UserService : IUserService
    {
        private readonly SupabaseDbContext _context;
        private readonly ITokenService _tokenService;
        private readonly Supabase.Client _supabase;

        // The UserService is responsible for handling all user-related operations, including authentication,
        // profile management, and role assignments. It interacts with the database through the SupabaseDbContext
        // and manages JWT tokens using the ITokenService. Additionally, it integrates with Supabase Storage for
        // handling profile picture uploads.
        public UserService(SupabaseDbContext context, ITokenService tokenService, Supabase.Client supabase)
        {
            _context = context;
            _tokenService = tokenService;
            _supabase = supabase;
        }

        public async Task<string?> RefreshTokenAsync(Guid userId)
        {
            var user = await _context.Users
                .Include(u => u.UserRole)
                .ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserID == userId && u.IsActive);

            if (user == null) return null;

            return _tokenService.CreateToken(user, user.UserRole); // generate new token

        }

        public async Task<TokenExchangeRequestDto?> RefreshTokenAsync(string expiredToken, string refreshToken)
        {
            // Validate the expired token and get the UserID (using TokenService helper)
            var userId = _tokenService.GetUserIdFromExpiredToken(expiredToken);

            var user = await _context.Users
                .Include(u => u.UserRole).ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.UserID == userId);

            // Does the token match what's in the DB? Is it expired?
            if (user == null || user.RefreshToken != refreshToken || user.RefreshTokenExpiry <= DateTime.UtcNow)
                return null;

            // Generate NEW pair (Rotation)
            var newAccessToken = _tokenService.CreateToken(user, user.UserRole);
            var newRefreshToken = GenerateRefreshToken();

            user.RefreshToken = newRefreshToken;
            await _context.SaveChangesAsync();

            return new TokenExchangeRequestDto
            {
                Token = newAccessToken,
                RefreshToken = newRefreshToken,
                Roles = user.UserRole.Select(ur => ur.Role.Name).ToList()
            };
        }

        public async Task<TokenExchangeRequestDto?> LoginAsync(LoginRequestDto dto)
        {
            var user = await _context.Users
                .Include(u => u.UserRole).ThenInclude(ur => ur.Role)
                .FirstOrDefaultAsync(u => u.Email == dto.Email && u.IsActive);

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return null;

            // 1. Generate Access Token (Short-lived: 1 hour)
            var accessToken = _tokenService.CreateToken(user, user.UserRole);

            // 2. Generate Refresh Token (Long-lived: 7 days)
            var refreshToken = GenerateRefreshToken();

            // 3. Save to DB
            user.RefreshToken = refreshToken;
            user.RefreshTokenExpiry = DateTime.UtcNow.AddDays(7);
            await _context.SaveChangesAsync();

            return new TokenExchangeRequestDto
            {
                Token = accessToken,
                RefreshToken = refreshToken, 
                Roles = user.UserRole.Select(ur => ur.Role.Name).ToList()
            };
        }

        private string GenerateRefreshToken()
        {
            var randomNumber = new byte[64];
            using var rng = RandomNumberGenerator.Create();
            rng.GetBytes(randomNumber);
            return Convert.ToBase64String(randomNumber);
        }

        public async Task<IEnumerable<GetUserDto>> GetAllUsersAsync()
        {
            return await _context.Users
                .Where(u => u.IsActive)
                .Select(u => new GetUserDto
                {
                    UserID = u.UserID,
                    FullName = u.FullName,
                    Email = u.Email,
                    Phone = u.Phone,
                    CreatedAt = u.CreatedAt,
                    Roles = u.UserRole.Select(ur => ur.RoleID).ToList()

                })
                .ToListAsync();
        }

        public async Task<GetUserDto?> GetUserByIdAsync(Guid id)
        {
            var user = await _context.Users
                .Include(u => u.UserRole)        // load the join table
                    .ThenInclude(ur => ur.Role)  // load the actual Role entity
                .FirstOrDefaultAsync(u => u.UserID == id && u.IsActive);

            if (user == null) return null;

            return new GetUserDto
            {
                UserID = user.UserID,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                CreatedAt = user.CreatedAt,
                Roles = user.UserRole.Select(ur => ur.RoleID).ToList()
            };
        }


        public async Task<GetUserDto> CreateUserAsync(CreateUserDto dto)
        {
            if (await _context.Users.AnyAsync(u => u.Email == dto.Email))
                throw new Exception("Email already exists");

            var user = new User
            {
                UserID = Guid.NewGuid(),
                FullName = dto.FullName,
                Email = dto.Email,
                Phone = dto.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                DateOfBirth = dto.DateOfBirth.HasValue
                    ? DateTime.SpecifyKind(dto.DateOfBirth.Value, DateTimeKind.Utc) : null,
                Location = dto.Location,
                Gender = dto.Gender,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            // attach role
            user.UserRole.Add(new UserRole
            {
                RoleID = 2 // default to member role
            });

            _context.Users.Add(user);

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine(ex.InnerException?.Message ?? ex.Message); // returning message to be chaanged later for better error handling and security
                throw;
            }

            return new GetUserDto
            {
                UserID = user.UserID,
                FullName = user.FullName,
                Email = user.Email,
                Phone = user.Phone,
                CreatedAt = user.CreatedAt,
                Roles = user.UserRole.Select(ur => ur.RoleID).ToList(),  // we will edit this later when we have proper role management
            };
        }

        public async Task<bool> UpdateUserAsync(Guid id, UpdateUserDto dto) // for admin
        {
            // 1. INPUT THE GUID: We use the ID to pull the specific row from the DB
            var user = await _context.Users
                .Include(u => u.UserRole)
                .FirstOrDefaultAsync(u => u.UserID == id);

            // 2. CHECK: If the ID doesn't exist, we can't edit anything
            if (user == null) return false;

            // 3. EDIT NAME: Overwrite the name column if a new one is provided
            if (!string.IsNullOrWhiteSpace(dto.FullName))
                user.FullName = dto.FullName;

            // 4. EDIT PHONE: Overwrite the phone column
            if (!string.IsNullOrWhiteSpace(dto.Phone))
                user.Phone = dto.Phone;

            // 5. EDIT ROLES: 
            // If the admin sends [1, 2], and user only had [1], this adds [2].
            if (dto.RoleIDs != null)
            {
                var targetRoleIds = dto.RoleIDs.ToHashSet();
                var currentRoleIds = user.UserRole.Select(ur => ur.RoleID).ToHashSet();

                // Remove roles not in the new list
                var toRemove = user.UserRole.Where(ur => !targetRoleIds.Contains(ur.RoleID)).ToList();
                _context.UserRole.RemoveRange(toRemove);

                // Add roles that are new
                var toAdd = targetRoleIds
                    .Where(rid => !currentRoleIds.Contains(rid))
                    .Select(rid => new UserRole { RoleID = rid, UserID = user.UserID })
                    .ToList();

                await _context.UserRole.AddRangeAsync(toAdd);
            }


            int changes = await _context.SaveChangesAsync();
            return true;
        }



        public async Task<bool> DeactivateUserAsync(Guid id)
        {
            var user = await _context.Users.FindAsync(id);
            if (user == null) return false;

            user.IsActive = false;
            await _context.SaveChangesAsync();
            return true;
        }


        public async Task<bool> UpdateProfileAsync(Guid userId, EditProfileDto dto)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null) return false;

            // Handle Image Upload to Supabase Storage
            if (dto.ImageFile != null)
            {
                var fileName = $"{userId}/profilepictureurl_{DateTime.UtcNow.Ticks}.jpg";

                using var stream = new MemoryStream();
                await dto.ImageFile.CopyToAsync(stream);

                stream.Position = 0; 
                var fileBytes = stream.ToArray();

                await _supabase.Storage
                      .From("profilepictureurl")
                      .Upload(fileBytes, fileName, new Supabase.Storage.FileOptions { Upsert = true });

                var publicUrl = _supabase.Storage.From("profilepictureurl").GetPublicUrl(fileName);
                user.ProfilePictureUrl = publicUrl;
            }

            // Update other fields
            user.Biography = dto.Biography ?? user.Biography;
            user.MedicalConditions = dto.MedicalConditions ?? user.MedicalConditions;
            user.EmergencyContact = dto.EmergencyContact ?? user.EmergencyContact;

            _context.Entry(user).State = EntityState.Modified;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
