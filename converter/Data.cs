class GalleryData
{
    public GalleryData(string title)
    {
        this.Title = title;
        this.Photos = new List<Photo>();
    }

    public string Title { get; private set; }
    public List<Photo> Photos { get; set; }
}

class Photo
{
    public Photo(string file, string description, uint l_width, uint l_height, uint s_width, uint s_height)
    {
        this.File = file;
        this.Description = description;
        this.l_width = l_width;
        this.l_height = l_height;
        this.s_width = s_width;
        this.s_height = s_height;
    }

    public string File { get; private set; }
    public string Description { get; private set; }
    public uint l_width { get; private set; }
    public uint l_height { get; private set; }
    public uint s_width { get; private set; }
    public uint s_height { get; private set; }
}