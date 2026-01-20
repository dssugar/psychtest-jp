'use client';

interface SocialShareButtonsProps {
  shareUrl: string;
  text?: string;
}

/**
 * Twitter/Facebook等のSNSシェアボタン
 * シェアページURLを生成して、各SNSのシェアダイアログを開く
 */
export function SocialShareButtons({
  shareUrl,
  text = '私の診断結果！',
}: SocialShareButtonsProps) {
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(text);

  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;
  const facebookUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
  const lineUrl = `https://social-plugins.line.me/lineit/share?url=${encodedUrl}`;

  const handleShare = (url: string) => {
    window.open(url, '_blank', 'width=600,height=400');
  };

  return (
    <div className="flex gap-3">
      {/* Twitter */}
      <button
        onClick={() => handleShare(twitterUrl)}
        className="flex-1 bg-[#1DA1F2] text-white font-bold py-3 px-4 border-4 border-brutal-black hover:bg-[#1a8cd8] transition-colors"
        aria-label="Twitterでシェア"
      >
        𝕏 Twitter
      </button>

      {/* Facebook */}
      <button
        onClick={() => handleShare(facebookUrl)}
        className="flex-1 bg-[#1877F2] text-white font-bold py-3 px-4 border-4 border-brutal-black hover:bg-[#166fe5] transition-colors"
        aria-label="Facebookでシェア"
      >
        f Facebook
      </button>

      {/* LINE */}
      <button
        onClick={() => handleShare(lineUrl)}
        className="flex-1 bg-[#06C755] text-white font-bold py-3 px-4 border-4 border-brutal-black hover:bg-[#05b34c] transition-colors"
        aria-label="LINEでシェア"
      >
        LINE
      </button>
    </div>
  );
}
