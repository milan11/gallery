class PrevData
{
    public PrevData(string title, Dictionary<string, string> descriptions)
    {
        this.Title = title;
        this.Descriptions = descriptions;
    }

    public string Title { get; private set; }
    public Dictionary<string, string> Descriptions { get; private set; }
}