using GYMIND.API.DTOs;

namespace GYMIND.API.Interfaces
{
    public interface IGymService
    {
        //  Gyms 

        Task<IEnumerable<GymDto>> GetAllGymsAsync();

        Task<GymDto?> GetGymByIdAsync(Guid id);

        Task<GymDto?> GetGymByNameAsync(string name);

        Task<IEnumerable<GymDto>> GetGymsByAddressAsync(string address);

        Task<GymDto> CreateGymAsync(GymDto dto);

        Task<bool> UpdateGymAsync(Guid id, GymDto dto);


        //  Branches 

        Task<GymBranchDto> CreateBranchAsync(Guid gymId, GymBranchDto dto);

        Task<GymBranchDto?> GetBranchByIdAsync(Guid branchId);

        Task<bool> UpdateBranchAsync(Guid branchId, GymBranchDto dto);
    }
}
