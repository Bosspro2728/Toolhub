import { BsFillImageFill, BsFileEarmarkTextFill, BsFillCameraVideoFill } from 'react-icons/bs';
import { FaFileAudio } from 'react-icons/fa';
import { AiFillFile } from 'react-icons/ai';
import { PiSpeakerSimpleHighFill } from 'react-icons/pi';
import { IconType } from 'react-icons';

export default function fileToIcon(file_type: string): IconType {
  if (file_type.includes('video')) return BsFillCameraVideoFill;
  if (file_type.includes('audio')) return PiSpeakerSimpleHighFill;
  if (file_type.includes('text')) return BsFileEarmarkTextFill;
  if (file_type.includes('image')) return BsFillImageFill;
  return AiFillFile;
}