const normalize = (value) => String(value ?? '').trim().toLocaleLowerCase('id')
const sameSet = (a = [], b = []) => [...a].sort().join('|') === [...b].sort().join('|')

export function scoreAnswer(question, answer, complexMode = 'proporsional') {
  const { jenis, konten = {} } = question
  if (jenis === 'uraian') return { score: Number(answer?.nilaiGuru ?? 0), pending: answer?.nilaiGuru == null }
  if (jenis === 'pilihan_ganda') return { score: Number(answer?.pilihan === konten.correct?.[0]) ? Number(question.bobot) : 0, pending: false }
  if (jenis === 'pilihan_ganda_kompleks') {
    const selected = answer?.pilihan ?? []
    const correct = konten.correct ?? []
    if (complexMode === 'semua_benar') return { score: sameSet(selected, correct) ? Number(question.bobot) : 0, pending: false }
    const proportion = correct.length ? selected.filter((v) => correct.includes(v)).length / correct.length : 0
    return { score: selected.some((v) => !correct.includes(v)) ? 0 : Number(question.bobot) * proportion, pending: false }
  }
  if (jenis === 'benar_salah') {
    const statements = konten.statements ?? []
    const right = statements.filter((s, i) => Boolean(answer?.nilai?.[i]) === Boolean(s.correct)).length
    return { score: statements.length ? Number(question.bobot) * right / statements.length : 0, pending: false }
  }
  if (jenis === 'menjodohkan') {
    const pairs = konten.pairs ?? []
    const right = pairs.filter((pair, i) => normalize(answer?.pasangan?.[i]) === normalize(pair.right)).length
    return { score: pairs.length ? Number(question.bobot) * right / pairs.length : 0, pending: false }
  }
  if (jenis === 'isian_singkat') return { score: (konten.accepted ?? []).some((v) => normalize(v) === normalize(answer?.teks)) ? Number(question.bobot) : 0, pending: false }
  return { score: 0, pending: false }
}

export function summarizeResult(questions, answers, complexMode) {
  const parts = questions.map((question) => scoreAnswer(question, answers[question.id], complexMode))
  const totalWeight = questions.reduce((sum, q) => sum + Number(q.bobot || 0), 0)
  const earned = parts.reduce((sum, p) => sum + p.score, 0)
  return { nilai: totalWeight ? Math.round(earned / totalWeight * 10000) / 100 : 0, sementara: parts.some((p) => p.pending), earned, totalWeight }
}
