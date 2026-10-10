using Microsoft.EntityFrameworkCore;
using SmartERP.API.Data;

namespace SmartERP.API.Services;

public class TechnicianAssignmentService
{
    private readonly AppDbContext _context;

    public TechnicianAssignmentService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<object?> RecommendTechnicians(int workOrderId)
    {
        var workOrder = await _context.WorkOrders
            .FindAsync(workOrderId);

        if (workOrder == null)
            return null;

        var technicians = await _context.Technicians
            .Where(t => t.IsAvailable &&
                t.Skill.ToLower() == workOrder.RequiredSkill.ToLower())
            .ToListAsync();

        var recommendations = technicians.Select(t =>
        {
            double distance = CalculateDistance(
                workOrder.Latitude,
                workOrder.Longitude,
                t.Latitude,
                t.Longitude
            );

            // Eligible technicians have matching skills
            // and are available.
            double skillScore = 40;
            double availabilityScore = 25;

            // Fewer active jobs means a higher score.
            double workloadScore =
                Math.Max(0, 20 - t.CurrentWorkload * 5);

            // Approximate distance-based score.
            double distanceScore =
                Math.Max(0, 15 - distance * 0.5);

            double totalScore =
                skillScore +
                availabilityScore +
                workloadScore +
                distanceScore;

            return new
            {
                technicianId = t.Id,
                technicianName = t.Name,
                skill = t.Skill,
                distanceKm = Math.Round(distance, 2),
                currentWorkload = t.CurrentWorkload,
                score = Math.Round(totalScore, 2)
            };
        })
        .OrderByDescending(t => t.score)
        .ToList();

        return new
        {
            workOrderId = workOrder.Id,
            workOrderTitle = workOrder.Title,
            recommendations
        };
    }

    private static double CalculateDistance(
        double lat1, double lon1,
        double lat2, double lon2)
    {
        const double earthRadiusKm = 6371;

        double dLat = ToRadians(lat2 - lat1);
        double dLon = ToRadians(lon2 - lon1);

        double a =
            Math.Pow(Math.Sin(dLat / 2), 2) +
            Math.Cos(ToRadians(lat1)) *
            Math.Cos(ToRadians(lat2)) *
            Math.Pow(Math.Sin(dLon / 2), 2);

        double c = 2 * Math.Atan2(
            Math.Sqrt(a),
            Math.Sqrt(Math.Max(0, 1 - a))
        );

        return earthRadiusKm * c;
    }

    private static double ToRadians(double degrees)
    {
        return degrees * Math.PI / 180;
    }
}