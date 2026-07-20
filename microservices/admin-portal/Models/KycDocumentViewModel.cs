namespace admin_portal.Models;

public class KycDocumentViewModel
{
    public long Id { get; set; }
    public long UserId { get; set; }
    public string? Type { get; set; }
    public string? Status { get; set; }
    public string? VerificationNotes { get; set; }
    public DateTime? UploadedAt { get; set; }
    public DateTime? VerifiedAt { get; set; }
}
