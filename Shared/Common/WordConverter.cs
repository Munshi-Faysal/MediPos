namespace Shared.Common;

public static class WordConverter
{
    private static readonly Dictionary<string, string> WordMap = new()
    {
        { "Reject", "Rejected" },
        { "Complete", "Completed" },
        { "Recommend", "Recommended" },
        { "Approve", "Approved" },
        { "Create", "Created" },
        { "Cancel", "Canceled" },
        { "Refer", "Referred" },
        { "Clarify", "Clarified" },
        { "Change", "Changed" },
        { "Resubmit", "Resubmitted" },
        { "Return", "Returned" },
        { "amend", "amended" },
        {string.Empty, string.Empty}
    };

    public static string ConvertToPastTense(string word)
    {
        return WordMap.GetValueOrDefault(word, word);
    }
}