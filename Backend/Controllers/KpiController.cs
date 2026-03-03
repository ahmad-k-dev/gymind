using Microsoft.AspNetCore.Mvc;
using Supabase;
using System.Text.Json;
using GYMIND.API.DTOs;

namespace GYMIND.API.Controllers
{
    [ApiController]
    [Route("api/kpi")]
    public class KpiController : ControllerBase
    {
        private readonly Client _supabase;

        public KpiController(Client supabase)
        {
            _supabase = supabase;
        }

        [HttpPost("branch-traffic-now")]
        public async Task<IActionResult> BranchTrafficNow([FromBody] KpiBranchTrafficNowRequestDto req)
        {
            // Replace the previous rpc + JsonSerializer code with a typed RPC call
            var rowsEnumerable = await _supabase.Rpc<IEnumerable<KpiBranchTrafficNowRowDto>>(
                "kpi_branch_traffic_now",
                new { p_gymbranchid = req.GymBranchId });

            var rows = rowsEnumerable?.ToList() ?? new List<KpiBranchTrafficNowRowDto>();
            if (rows.Count == 0)
                return NotFound(new { message = "No traffic data found for this branch." });

            return Ok(rows[0]);
        }
    }
}