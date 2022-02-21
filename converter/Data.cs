class GalleryData
{
    public GalleryData(string title)
    {
        this.Title = title;
        this.Photos = new List<Photo>();
    }

    public string Title { get; private set; }
    public List<Photo> Photos { get; private set; }
}

class Photo
{
    public Photo(string file, string description)
    {
        this.File = file;
        this.Description = description;
    }

    public string File { get; private set; }
    public string Description { get; private set; }
}