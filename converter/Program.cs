﻿using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Imaging;
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

        var files = Directory.GetFiles(sourceDir);

        GalleryData data = new GalleryData("Gallery");

        List<Photo> photos_almostSquare = new List<Photo>();
        List<Photo> photos_landscape = new List<Photo>();
        List<Photo> photos_portrait = new List<Photo>();

        ImageCodecInfo encoder = GetEncoderInfo(ImageFormat.Jpeg);

        EncoderParameters encoderParams = new EncoderParameters(1);
        encoderParams.Param[0] = new EncoderParameter(System.Drawing.Imaging.Encoder.Quality, 90L);

        foreach (var origFilePath in files)
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
                "",
                (uint)newImage_l.Width,
                (uint)newImage_l.Height,
                (uint)newImage_s.Width,
                (uint)newImage_s.Height
                );

            if (IsAlmostSquare(origImage.Width, origImage.Height))
            {
                photos_almostSquare.Add(photo);
            }
            else if (IsLandscape(origImage.Width, origImage.Height))
            {
                photos_landscape.Add(photo);
            }
            else
            {
                photos_portrait.Add(photo);
            }
        }

        if (photos_landscape.Count >= photos_portrait.Count)
        {
            photos_landscape.AddRange(photos_almostSquare);
        }
        else
        {
            photos_portrait.AddRange(photos_almostSquare);
        }

        data.Photos.AddRange(photos_landscape.OrderBy(p => NormalizeFileNameForSorting(p.File)));
        data.Photos.AddRange(photos_portrait.OrderBy(p => NormalizeFileNameForSorting(p.File)));

        var options = new JsonSerializerOptions()
        {
            WriteIndented = true,
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        File.WriteAllText(Path.Combine(targetDir, "_data.json"), JsonSerializer.Serialize(data, options), Encoding.UTF8);
    }

    private static bool IsAlmostSquare(int width, int height)
    {
        double ratio = (width >= height) ? ((double)height / (double)width) : ((double)width / (double)height);

        return ratio >= 0.85;
    }

    private static bool IsLandscape(int width, int height)
    {
        return width >= height;
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
}