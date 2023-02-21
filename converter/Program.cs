using System.Drawing;
using System.Drawing.Drawing2D;
using System.Text;
using System.Text.Json;

public static class Converter
{
    public static void Main(string[] args)
    {
        if (args.Length != 2)
        {
            Console.Error.WriteLine("Usage: converter <source_dir> <target_dir>");
            Environment.Exit(2);
        }

        string sourceDir = args[0];
        string targetDir = args[1];

        if (Directory.GetFiles(targetDir).Any())
        {
            Console.Error.WriteLine("Target directory is not empty: {0}", targetDir);
            Environment.Exit(3);
        }

        var files = Directory.GetFiles(sourceDir).OrderBy(NormalizeFileNameForSorting);

        GalleryData data = new GalleryData("Gallery");

        List<Photo> photos_landscape = new List<Photo>();
        List<Photo> photos_portrait = new List<Photo>();

        foreach (var origFilePath in files)
        {
            using Image origImage = Image.FromFile(origFilePath);

            using Image newImage_l = ScaleImage(origImage, 2000, 2000);
            using Image newImage_s = ScaleImage(origImage, 500, 500);

            string fileName = Path.GetFileName(origFilePath);

            newImage_l.Save(Path.Combine(targetDir, "l_" + fileName), System.Drawing.Imaging.ImageFormat.Jpeg);
            newImage_s.Save(Path.Combine(targetDir, "s_" + fileName), System.Drawing.Imaging.ImageFormat.Jpeg);

            var photo = new Photo(
                fileName,
                "",
                (uint)newImage_l.Width,
                (uint)newImage_l.Height,
                (uint)newImage_s.Width,
                (uint)newImage_s.Height
                );

            if (origImage.Width >= origImage.Height)
            {
                photos_landscape.Add(photo);
            }
            else
            {
                photos_portrait.Add(photo);
            }
        }

        data.Photos.AddRange(photos_landscape);
        data.Photos.AddRange(photos_portrait);

        var options = new JsonSerializerOptions()
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        File.WriteAllText(Path.Combine(targetDir, "_data.json"), JsonSerializer.Serialize(data, options), Encoding.UTF8);
    }

    private static string NormalizeFileNameForSorting(string fileName)
    {
        return fileName
            .Replace("-", "")
            .Replace("_", "")
            ;
    }

    private static Image ScaleImage(Image image, int maxWidth, int maxHeight)
    {
        var ratioX = (double)maxWidth / image.Width;
        var ratioY = (double)maxHeight / image.Height;
        var ratio = Math.Min(ratioX, ratioY);

        if (ratio > 1)
        {
            ratio = 1;
        }

        var newWidth = (int)(image.Width * ratio);
        var newHeight = (int)(image.Height * ratio);

        var newImage = new Bitmap(newWidth, newHeight);

        using (var graphics = Graphics.FromImage(newImage))
        {
            graphics.InterpolationMode = InterpolationMode.High;
            graphics.CompositingQuality = CompositingQuality.HighQuality;
            graphics.SmoothingMode = SmoothingMode.AntiAlias;
            graphics.DrawImage(image, 0, 0, newWidth, newHeight);
        }

        return newImage;
    }
}