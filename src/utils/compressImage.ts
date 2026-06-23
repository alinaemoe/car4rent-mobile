import { ImageManipulator, SaveFormat } from "expo-image-manipulator";

interface CompressOptions {
  /** Максимальная ширина результата в пикселях (высота считается пропорционально). */
  maxWidth?: number;
  /** Качество JPEG от 0 до 1. */
  compress?: number;
}

/**
 * Ужимает изображение перед загрузкой на сервер: ресайзит по ширине и пережимает
 * в JPEG. Фото с камеры весят несколько МБ в полном разрешении — после сжатия
 * это сотни КБ, что кратно ускоряет аплоад по мобильной сети и снимает риск
 * упереться в таймаут/лимиты.
 *
 * При любой ошибке возвращает исходный uri — загрузка не должна падать из-за
 * того, что не удалось сжать.
 */
export async function compressImage(
  uri: string,
  { maxWidth = 1600, compress = 0.6 }: CompressOptions = {},
): Promise<string> {
  try {
    const context = ImageManipulator.manipulate(uri);
    context.resize({ width: maxWidth });
    const ref = await context.renderAsync();
    const result = await ref.saveAsync({
      compress,
      format: SaveFormat.JPEG,
    });
    return result.uri;
  } catch (error) {
    console.warn("compressImage: не удалось сжать, шлём оригинал", error);
    return uri;
  }
}
