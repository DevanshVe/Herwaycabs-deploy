using admin_portal.Models;

namespace admin_portal.Services;

public interface IKycService
{
    Task<List<KycDocumentViewModel>> GetPending();
    Task Verify(long documentId, bool approved, string? notes);
}
