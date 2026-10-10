namespace SmartERP.API.Models;

public class WorkOrder
{
    public int Id { get; set; }

    public string Title { get; set; } = string.Empty;

    public string Description { get; set; } = string.Empty;

    public string RequiredSkill { get; set; } = string.Empty;

    public string Priority { get; set; } = "Medium";

    public string Status { get; set; } = "Pending";

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public int? AssignedTechnicianId { get; set; }

    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}