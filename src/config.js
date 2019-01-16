module.exports = {
  useShaathTemplates: false,

  estimationMetric: "totals", // "totals" / "bestMatchCounts"

  // test frames
  nOctaves: 5,
  nHarmonics:16,

  //downsampling
  sampleRate:11000,

  //fft
  fftSize:4096,
  hopSize:111
}
