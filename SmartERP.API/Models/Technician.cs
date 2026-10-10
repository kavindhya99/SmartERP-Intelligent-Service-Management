namespace SmartERP.API.Models;

public class Technician
{
    public int Id { get; set; }

    public string Name { get; set; } = string.Empty;

    public string Email { get; set; } = string.Empty;

    public string Skill { get; set; } = string.Empty;

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public bool IsAvailable { get; set; }

    public int CurrentWorkload { get; set; }
}