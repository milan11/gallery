using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
using System.Text;
using System.Text.Json;

public static class Converter
{
    private const string DataJsonFileName = "_data.json";

    public static void Main(string[] args)
    {
        if (args.Length != 2 && args.Length != 3)
        {
            Console.Error.WriteLine("Usage: converter <source_dir> <target_dir> <prev_target_dir>");
            Environment.Exit(2);
        }

        string sourceDir = args[0];
        string targetDir = args[1];

        if (File.Exists(Path.Combine(sourceDir, DataJsonFileName)))
        {
            Console.Error.WriteLine("Source directory contains {0}: {1} (maybe a mistake)", DataJsonFileName, sourceDir);
            Environment.Exit(3);
        }

        if (Directory.GetFiles(targetDir).Any())
        {
            Console.Error.WriteLine("Target directory is not empty: {0}", targetDir);
            Environment.Exit(3);
        }

        PrevData prevData = args.Length == 3 ? GetPrevData(args[2]) : new PrevData("Gallery", new Dictionary<string, string>());

        var files = Directory.GetFiles(sourceDir);

        GalleryData data = new GalleryData(prevData.Title);

        List<Photo> photos = new List<Photo>();

        ImageCodecInfo encoder = GetEncoderInfo(ImageFormat.Jpeg);

        EncoderParameters encoderParams = new EncoderParameters(1);
        encoderParams.Param[0] = new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, 90L);

        Parallel.ForEach(files, origFilePath =>
        {
            using Image origImage = Image.FromFile(origFilePath);
            Rotate(origImage);

            using Image newImage_l = ScaleImage(origImage, 2000, 2000);
            using Image newImage_s = ScaleImage(origImage, 500, 500);

            string fileName = Path.GetFileName(origFilePath);

            newImage_l.Save(Path.Combine(targetDir, "l_" + fileName), encoder, encoderParams);
            newImage_s.Save(Path.Combine(targetDir, "s_" + fileName), encoder, encoderParams);

            var photo = new Photo(
                fileName,
                prevData.Descriptions.GetValueOrDefault(fileName, ""),
                (uint)newImage_l.Width,
                (uint)newImage_l.Height,
                (uint)newImage_s.Width,
                (uint)newImage_s.Height
                );

            lock (photos)
            {
                photos.Add(photo);
            }
        });

        data.Photos.AddRange(photos.OrderBy(p => NormalizeFileNameForSorting(p.File)));

        var options = new JsonSerializerOptions()
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase,
            Encoder = System.Text.Encodings.Web.JavaScriptEncoder.UnsafeRelaxedJsonEscaping
        };

        File.WriteAllText(Path.Combine(targetDir, DataJsonFileName), JsonSerializer.Serialize(data, options), Encoding.UTF8);
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

    private const int ExifOrientationId = 0x112; // 274

    // https://stackoverflow.com/a/48347653/7164302
    private static void Rotate(Image img)
    {
        if (!img.PropertyIdList.Contains(ExifOrientationId))
        {
            return;
        }

        var prop = img.GetPropertyItem(ExifOrientationId);
        var val = prop.Value.Where(b => b != 0).FirstOrDefault();

        var rot = RotateFlipType.RotateNoneFlipNone;

        if (val == 3 || val == 4)
        {
            rot = RotateFlipType.Rotate180FlipNone;
        }
        else if (val == 5 || val == 6)
        {
            rot = RotateFlipType.Rotate90FlipNone;
        }
        else if (val == 7 || val == 8)
        {
            rot = RotateFlipType.Rotate270FlipNone;
        }

        if (val == 2 || val == 4 || val == 5 || val == 7)
        {
            rot |= RotateFlipType.RotateNoneFlipX;
        }

        if (rot != RotateFlipType.RotateNoneFlipNone)
        {
            img.RotateFlip(rot);
        }
    }

    private static ImageCodecInfo GetEncoderInfo(ImageFormat format)
    {
        return ImageCodecInfo.GetImageEncoders().Single(codec => codec.FormatID == format.Guid);
    }

    private static PrevData GetPrevData(string prevTargetDir)
    {
        var options = new JsonSerializerOptions()
        {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        GalleryData prevGalleryData = JsonSerializer.Deserialize<GalleryData>(File.ReadAllText(Path.Combine(prevTargetDir, DataJsonFileName), Encoding.UTF8), options)!;

        Dictionary<string, string> descriptions = new();
        foreach (var photo in prevGalleryData.Photos)
        {
            descriptions.Add(photo.File, photo.Description);
        }

        return new PrevData(prevGalleryData.Title, descriptions);
    }
}