using GYMIND.API.DTOs;
using GYMIND.API.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace GYMIND.API.Controllers
{
    [ApiController]
    [Route("api/gyms")]
    public class GymsController : ControllerBase
    {
        private readonly IGymService _gymService;

        public GymsController(IGymService gymService)
        {
            _gymService = gymService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var gyms = await _gymService.GetAllGymsAsync();
            return Ok(gyms);
        }

        [HttpGet("{id:guid}")]
        public async Task<IActionResult> GetById(Guid id)
        {
            var gym = await _gymService.GetGymByIdAsync(id);
            return gym is null ? NotFound() : Ok(gym);
        }

        [HttpGet("by-name/{name}")]
        public async Task<IActionResult> GetByName(string name)
        {
            var gym = await _gymService.GetGymByNameAsync(name);
            return gym is null ? NotFound() : Ok(gym);
        }

        [HttpGet("by-address/{address}")]
        public async Task<IActionResult> GetByAddress(string address)
        {
            var gyms = await _gymService.GetGymsByAddressAsync(address);
            return !gyms.Any() ? NotFound() : Ok(gyms);
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] GymDto dto)
        {
            var created = await _gymService.CreateGymAsync(dto);

            return CreatedAtAction(
                nameof(GetById),
                new { id = created.GymID },
                created
            );
        }

        [HttpPut("{id:guid}")]
        public async Task<IActionResult> Update(Guid id, [FromBody] GymDto dto)
        {
            var updated = await _gymService.UpdateGymAsync(id, dto);
            return updated ? NoContent() : NotFound();
        }

        [HttpPost("{gymId:guid}/branches")]
        public async Task<IActionResult> CreateBranch(Guid gymId, [FromBody] GymBranchDto dto)
        {
            var branch = await _gymService.CreateBranchAsync(gymId, dto);

            return CreatedAtAction(
                nameof(GetBranch),
                new { branchId = branch.GymBranchID },
                branch
            );
        }

        [HttpGet("branches/{branchId:guid}")]
        public async Task<IActionResult> GetBranch(Guid branchId)
        {
            var branch = await _gymService.GetBranchByIdAsync(branchId);
            return branch is null ? NotFound() : Ok(branch);
        }

        [HttpPut("branches/{branchId:guid}")]
        public async Task<IActionResult> UpdateBranch(Guid branchId, [FromBody] GymBranchDto dto)
        {
            var updated = await _gymService.UpdateBranchAsync(branchId, dto);
            return updated ? NoContent() : NotFound();
        }
    }
}
