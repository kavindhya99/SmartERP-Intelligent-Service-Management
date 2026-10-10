using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartERP.API.Data;
using SmartERP.API.Models;

namespace SmartERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class TechniciansController : ControllerBase
{
    private readonly AppDbContext _context;

    public TechniciansController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/technicians
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Technician>>> GetAll()
    {
        var technicians = await _context.Technicians
            .AsNoTracking()
            .ToListAsync();

        return Ok(technicians);
    }

    // GET: api/technicians/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<Technician>> GetById(int id)
    {
        var technician = await _context.Technicians
            .AsNoTracking()
            .FirstOrDefaultAsync(t => t.Id == id);

        if (technician == null)
            return NotFound();

        return Ok(technician);
    }

    // POST: api/technicians
    [HttpPost]
    public async Task<ActionResult<Technician>> Create(
        Technician technician)
    {
        if (string.IsNullOrWhiteSpace(technician.Name) ||
            string.IsNullOrWhiteSpace(technician.Email) ||
            string.IsNullOrWhiteSpace(technician.Skill))
        {
            return BadRequest(new
            {
                message = "Name, email and skill are required."
            });
        }

        if (!ValidCoordinates(
            technician.Latitude,
            technician.Longitude))
        {
            return BadRequest(new
            {
                message = "Invalid technician coordinates."
            });
        }

        technician.Id = 0;

        // Workload is controlled by the assignment engine.
        technician.CurrentWorkload = 0;

        _context.Technicians.Add(technician);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = technician.Id },
            technician
        );
    }

    // PUT: api/technicians/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        Technician updatedTechnician)
    {
        var technician = await _context.Technicians.FindAsync(id);

        if (technician == null)
            return NotFound();

        if (string.IsNullOrWhiteSpace(updatedTechnician.Name) ||
            string.IsNullOrWhiteSpace(updatedTechnician.Email) ||
            string.IsNullOrWhiteSpace(updatedTechnician.Skill))
        {
            return BadRequest(new
            {
                message = "Name, email and skill are required."
            });
        }

        if (!ValidCoordinates(
            updatedTechnician.Latitude,
            updatedTechnician.Longitude))
        {
            return BadRequest(new
            {
                message = "Invalid technician coordinates."
            });
        }

        // Check whether this technician has assigned work orders.
        bool hasAssignedOrders = await _context.WorkOrders
            .AnyAsync(w =>
                w.AssignedTechnicianId == id);

        // Protect the skill used for existing assignments.
        if (hasAssignedOrders &&
            !string.Equals(
                technician.Skill,
                updatedTechnician.Skill,
                StringComparison.OrdinalIgnoreCase))
        {
            return Conflict(new
            {
                message =
                    "Cannot change the skill of a technician " +
                    "who has assigned work orders."
            });
        }

        technician.Name = updatedTechnician.Name;
        technician.Email = updatedTechnician.Email;
        technician.Skill = updatedTechnician.Skill;
        technician.Latitude = updatedTechnician.Latitude;
        technician.Longitude = updatedTechnician.Longitude;
        technician.IsAvailable = updatedTechnician.IsAvailable;

        // Do not update CurrentWorkload here.
        // It is managed by the assignment service.

        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/technicians/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var technician = await _context.Technicians.FindAsync(id);

        if (technician == null)
            return NotFound();

        bool hasAssignedOrders = await _context.WorkOrders
            .AnyAsync(w =>
                w.AssignedTechnicianId == id);

        if (hasAssignedOrders)
        {
            return Conflict(new
            {
                message =
                    "Cannot delete this technician because " +
                    "they are assigned to one or more work orders."
            });
        }

        _context.Technicians.Remove(technician);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    private static bool ValidCoordinates(
        double latitude,
        double longitude)
    {
        return double.IsFinite(latitude) &&
               double.IsFinite(longitude) &&
               latitude >= -90 &&
               latitude <= 90 &&
               longitude >= -180 &&
               longitude <= 180;
    }
}
