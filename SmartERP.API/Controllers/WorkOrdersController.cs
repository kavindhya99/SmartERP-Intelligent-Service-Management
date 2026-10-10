
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartERP.API.Data;
using SmartERP.API.Models;
using SmartERP.API.Services;

namespace SmartERP.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WorkOrdersController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly TechnicianAssignmentService _assignmentService;

    public WorkOrdersController(
        AppDbContext context,
        TechnicianAssignmentService assignmentService)
    {
        _context = context;
        _assignmentService = assignmentService;
    }

    // GET: api/workorders
    [HttpGet]
    public async Task<ActionResult<IEnumerable<WorkOrder>>> GetAll()
    {
        var workOrders = await _context.WorkOrders
            .AsNoTracking()
            .ToListAsync();

        return Ok(workOrders);
    }

    // GET: api/workorders/{id}
    [HttpGet("{id}")]
    public async Task<ActionResult<WorkOrder>> GetById(int id)
    {
        var workOrder = await _context.WorkOrders
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workOrder == null)
            return NotFound();

        return Ok(workOrder);
    }

    // POST: api/workorders
    [HttpPost]
    public async Task<ActionResult<WorkOrder>> Create(
        WorkOrder workOrder)
    {
        if (string.IsNullOrWhiteSpace(workOrder.Title) ||
            string.IsNullOrWhiteSpace(workOrder.RequiredSkill))
        {
            return BadRequest(new
            {
                message = "Title and required skill are mandatory."
            });
        }

        if (!ValidCoordinates(
            workOrder.Latitude,
            workOrder.Longitude))
        {
            return BadRequest(new
            {
                message = "Invalid work order coordinates."
            });
        }

        workOrder.Id = 0;
        workOrder.AssignedTechnicianId = null;
        workOrder.Status = "Pending";
        workOrder.CreatedAt = DateTime.UtcNow;

        _context.WorkOrders.Add(workOrder);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetById),
            new { id = workOrder.Id },
            workOrder
        );
    }

    // PUT: api/workorders/{id}
    [HttpPut("{id}")]
    public async Task<IActionResult> Update(
        int id,
        WorkOrder updatedWorkOrder)
    {
        var workOrder = await _context.WorkOrders.FindAsync(id);

        if (workOrder == null)
            return NotFound();

        // Protect existing technician assignments.
        if (workOrder.Status != "Pending" ||
            workOrder.AssignedTechnicianId != null)
        {
            return Conflict(new
            {
                message =
                    "Cannot edit a work order that is already assigned."
            });
        }

        if (string.IsNullOrWhiteSpace(updatedWorkOrder.Title) ||
            string.IsNullOrWhiteSpace(updatedWorkOrder.RequiredSkill))
        {
            return BadRequest(new
            {
                message = "Title and required skill are mandatory."
            });
        }

        if (!ValidCoordinates(
            updatedWorkOrder.Latitude,
            updatedWorkOrder.Longitude))
        {
            return BadRequest(new
            {
                message = "Invalid work order coordinates."
            });
        }

        workOrder.Title = updatedWorkOrder.Title;
        workOrder.Description = updatedWorkOrder.Description;
        workOrder.RequiredSkill = updatedWorkOrder.RequiredSkill;
        workOrder.Priority = updatedWorkOrder.Priority;
        workOrder.Latitude = updatedWorkOrder.Latitude;
        workOrder.Longitude = updatedWorkOrder.Longitude;

        // Status and assignment are not editable here.
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // DELETE: api/workorders/{id}
    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var workOrder = await _context.WorkOrders.FindAsync(id);

        if (workOrder == null)
            return NotFound();

        // Do not delete assigned work orders.
        if (workOrder.Status != "Pending" ||
            workOrder.AssignedTechnicianId != null)
        {
            return Conflict(new
            {
                message =
                    "Cannot delete a work order that is already assigned."
            });
        }

        _context.WorkOrders.Remove(workOrder);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    // GET: api/workorders/{id}/recommendations
    [HttpGet("{id}/recommendations")]
    public async Task<IActionResult> GetRecommendations(int id)
    {
        var workOrder = await _context.WorkOrders
            .AsNoTracking()
            .FirstOrDefaultAsync(w => w.Id == id);

        if (workOrder == null)
            return NotFound(new
            {
                message = "Work order not found."
            });

        if (workOrder.Status != "Pending" ||
            workOrder.AssignedTechnicianId != null)
        {
            return Conflict(new
            {
                message =
                    "Recommendations are only available for pending work orders."
            });
        }

        var result = await _assignmentService
            .RecommendTechnicians(id);

        return Ok(result);
    }

    // POST: api/workorders/{id}/assign/{technicianId}
    [HttpPost("{id}/assign/{technicianId}")]
    public async Task<IActionResult> AssignTechnician(
        int id,
        int technicianId)
    {
        await using var transaction =
            await _context.Database.BeginTransactionAsync();

        var workOrder = await _context.WorkOrders.FindAsync(id);

        if (workOrder == null)
            return NotFound(new
            {
                message = "Work order not found."
            });

        if (workOrder.Status != "Pending" ||
            workOrder.AssignedTechnicianId != null)
        {
            return Conflict(new
            {
                message = "Work order is already assigned."
            });
        }

        var technician = await _context.Technicians
            .FindAsync(technicianId);

        if (technician == null)
            return NotFound(new
            {
                message = "Technician not found."
            });

        if (!technician.IsAvailable)
        {
            return BadRequest(new
            {
                message = "Technician is unavailable."
            });
        }

        if (!string.Equals(
            technician.Skill,
            workOrder.RequiredSkill,
            StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new
            {
                message = "Technician skill does not match."
            });
        }

        workOrder.AssignedTechnicianId = technician.Id;
        workOrder.Status = "Assigned";

        // Workload is updated only through assignment.
        technician.CurrentWorkload++;

        await _context.SaveChangesAsync();
        await transaction.CommitAsync();

        return Ok(new
        {
            message = "Technician assigned successfully",
            workOrderId = workOrder.Id,
            technicianId = technician.Id,
            technicianName = technician.Name,
            status = workOrder.Status,
            currentWorkload = technician.CurrentWorkload
        });
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
